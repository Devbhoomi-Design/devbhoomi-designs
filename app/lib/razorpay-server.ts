import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import crypto from "crypto";

type CartItem = {
  id: number;
  quantity: number;
  cartKey?: string;
  customName?: string;
  customSize?: string;
  instructions?: string;
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
  referenceImageUrl?: string;
};

type ProductVariant = {
  id?: string | number;
  name?: unknown;
  price?: unknown;
};

type DbProduct = {
  id: number;
  name: string;
  price: number | string;
  variants?: unknown;
};

/**
 * Get the Bearer token sent by the browser.
 */
export const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  return token || null;
};

/**
 * Verify the logged-in Supabase user.
 */
export const getAuthedUser = async (
  request: Request
): Promise<{
  user: User;
  authClient: SupabaseClient;
}> => {
  const token = getBearerToken(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!token) {
    throw new Error("Authentication failed");
  }

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase server configuration is missing."
    );
  }

  const authClient = createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  // Validate the exact access token sent by the browser.
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    console.error(
      "Supabase token validation failed:",
      error
    );

    throw new Error("Authentication failed");
  }

  return {
    user,
    authClient,
  };
};

/**
 * Create a Supabase client using the Service Role key.
 *
 * IMPORTANT:
 * SUPABASE_SERVICE_ROLE_KEY must ONLY exist on the server.
 */
export const getServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing on the server."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

/**
 * Validate cart data and recalculate prices from Supabase.
 *
 * The browser's price is NOT trusted.
 */
export const normalizeCart = async (
  items: unknown[],
  db: SupabaseClient
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  if (items.length > 50) {
    throw new Error(
      "Your cart contains too many different items."
    );
  }

  const cleanItems: CartItem[] = items.map(
    (rawItem) => {
      const item = rawItem as Partial<CartItem>;

      return {
        id: Number(item.id),
        quantity: Number(item.quantity),

        cartKey:
          typeof item.cartKey === "string"
            ? item.cartKey
            : undefined,

        customName:
          typeof item.customName === "string"
            ? item.customName
            : undefined,

        customSize:
          typeof item.customSize === "string"
            ? item.customSize
            : undefined,

        instructions:
          typeof item.instructions === "string"
            ? item.instructions
            : undefined,

        variantId:
          typeof item.variantId === "string"
            ? item.variantId
            : undefined,

        variantName:
          typeof item.variantName === "string"
            ? item.variantName
            : undefined,

        variantPrice:
          typeof item.variantPrice === "number"
            ? item.variantPrice
            : undefined,

        referenceImageUrl:
          typeof item.referenceImageUrl === "string"
            ? item.referenceImageUrl
            : undefined,
      };
    }
  );

  for (const item of cleanItems) {
    if (
      !Number.isInteger(item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 50
    ) {
      throw new Error(
        "One of the items in your cart is invalid."
      );
    }
  }

  const productIds = Array.from(
    new Set(
      cleanItems.map((item) => item.id)
    )
  );

  const {
    data: products,
    error: productsError,
  } = await db
    .from("products")
    .select("id, name, price, variants")
    .in("id", productIds);

  if (productsError) {
    console.error(
      "Product validation error:",
      productsError
    );

    throw new Error(
      `Could not validate products: ${productsError.message}`
    );
  }

  const productMap =
    new Map<number, DbProduct>();

  for (const product of products || []) {
    productMap.set(Number(product.id), {
      id: Number(product.id),
      name: String(
        product.name ||
          `Product #${product.id}`
      ),
      price: product.price,
      variants: product.variants,
    });
  }

  if (
    productMap.size !== productIds.length
  ) {
    throw new Error(
      "One or more products in your cart are no longer available."
    );
  }

  let subtotal = 0;

  const normalizedItems = cleanItems.map(
    (item) => {
      const product = productMap.get(
        item.id
      );

      if (!product) {
        throw new Error(
          "A product in your cart is no longer available."
        );
      }

      const basePrice = Number(
        product.price
      );

      if (
        !Number.isFinite(basePrice) ||
        basePrice < 0
      ) {
        throw new Error(
          `Invalid price for ${product.name}.`
        );
      }

      let unitPrice = basePrice;
      let finalVariantName =
        item.variantName;

      /**
       * Validate variant against the database.
       */
      if (item.variantId) {
        const variants: ProductVariant[] =
          Array.isArray(product.variants)
            ? (product.variants as ProductVariant[])
            : [];

        const variant =
          variants.find(
            (candidate) =>
              String(candidate.id) ===
              String(item.variantId)
          );

        if (!variant) {
          throw new Error(
            `Variant for ${product.name} is no longer available.`
          );
        }

        const databaseVariantPrice =
          Number(variant.price);

        if (
          !Number.isFinite(
            databaseVariantPrice
          ) ||
          databaseVariantPrice < 0
        ) {
          throw new Error(
            `Invalid variant price for ${product.name}.`
          );
        }

        unitPrice =
          databaseVariantPrice;

        finalVariantName =
          String(
            variant.name ||
              item.variantId
          );
      }

      const lineTotal =
        unitPrice * item.quantity;

      subtotal += lineTotal;

      return {
        ...item,

        productName:
          product.name,

        variantName:
          finalVariantName,

        // Trusted database price
        variantPrice:
          unitPrice,

        unitPrice,

        lineTotal,
      };
    }
  );

  if (
    !Number.isFinite(subtotal) ||
    subtotal <= 0
  ) {
    throw new Error(
      "Your order total is invalid."
    );
  }

  // Current Devbhoomi checkout uses free delivery.
  const delivery = 0;

  const total =
    subtotal + delivery;

  return {
    items: normalizedItems,
    subtotal,
    delivery,
    total,
  };
};

/**
 * Get Razorpay credentials.
 */
const getRazorpayCredentials = () => {
  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay keys are missing on the server."
    );
  }

  return {
    keyId,
    keySecret,
  };
};

/**
 * Create a Razorpay order.
 */
export const createRazorpayOrder =
  async (
    amountInRupees: number,
    receipt: string,
    notes: Record<string, string>
  ) => {
    const {
      keyId,
      keySecret,
    } = getRazorpayCredentials();

    if (
      !Number.isFinite(
        amountInRupees
      ) ||
      amountInRupees <= 0
    ) {
      throw new Error(
        "Invalid payment amount."
      );
    }

    const amountInPaise =
      Math.round(
        amountInRupees * 100
      );

    const credentials =
      Buffer.from(
        `${keyId}:${keySecret}`
      ).toString("base64");

    const response = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,
          notes,
        }),

        cache: "no-store",
      }
    );

    const data =
      (await response.json()) as {
        id?: string;
        amount?: number;
        currency?: string;
        status?: string;
        error?: {
          description?: string;
        };
      };

    if (
      !response.ok ||
      !data.id ||
      typeof data.amount !==
        "number"
    ) {
      throw new Error(
        data.error?.description ||
          "Razorpay could not create the payment order."
      );
    }

    return {
      id: data.id,
      amount: data.amount,
      currency:
        data.currency || "INR",
      keyId,
    };
  };

/**
 * Fetch a Razorpay order.
 */
export const fetchRazorpayOrder =
  async (
    orderId: string
  ) => {
    const {
      keyId,
      keySecret,
    } = getRazorpayCredentials();

    const credentials =
      Buffer.from(
        `${keyId}:${keySecret}`
      ).toString("base64");

    const response = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(
        orderId
      )}`,
      {
        method: "GET",

        headers: {
          Authorization: `Basic ${credentials}`,
        },

        cache: "no-store",
      }
    );

    const data =
      (await response.json()) as {
        id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };

    if (
      !response.ok ||
      !data.id ||
      typeof data.amount !==
        "number"
    ) {
      throw new Error(
        "Could not verify the Razorpay order."
      );
    }

    return data;
  };

/**
 * Fetch a Razorpay payment.
 */
export const fetchRazorpayPayment =
  async (
    paymentId: string
  ) => {
    const {
      keyId,
      keySecret,
    } = getRazorpayCredentials();

    const credentials =
      Buffer.from(
        `${keyId}:${keySecret}`
      ).toString("base64");

    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(
        paymentId
      )}`,
      {
        method: "GET",

        headers: {
          Authorization: `Basic ${credentials}`,
        },

        cache: "no-store",
      }
    );

    const data =
  (await response.json()) as {
    id?: string;
    order_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    method?: string;
  };

    if (
      !response.ok ||
      !data.id ||
      typeof data.amount !==
        "number"
    ) {
      throw new Error(
        "Could not verify the Razorpay payment."
      );
    }

    return data;
  };

/**
 * Verify Razorpay's payment signature.
 */
export const verifyRazorpaySignature =
  (
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    const {
      keySecret,
    } = getRazorpayCredentials();

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          keySecret
        )
        .update(
          `${orderId}|${paymentId}`
        )
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const actualBuffer =
      Buffer.from(
        signature || "",
        "utf8"
      );

    if (
      expectedBuffer.length !==
      actualBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      expectedBuffer,
      actualBuffer
    );
  };