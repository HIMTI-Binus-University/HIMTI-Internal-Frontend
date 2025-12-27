const API_BASE_URL = "http://72.62.122.54:8001/api/url";

/**
 * ====================================
 * Types & Interfaces
 * ====================================
 */

// CREATE URL HEADERS
type urlPayload = {
  originalUrl: string;
  shortCode: string;
  expiresAt?: string | null;
};


/**
 * ====================================
 * Queries (POST requests)
 * ====================================
 *
 */

// CREATE NEW SHORTLINK URL
export const createShortUrl = async (payload: urlPayload) => {
  const response = await fetch(
    `${API_BASE_URL}/create-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create short URL");
  }

  return response.json();
};

/**
 * ====================================
 * Queries (GET requests)
 * ====================================
 */

export const getUrlList = async () => {
  const response = await fetch(
    `${API_BASE_URL}/get-list?status=a`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch URL list");
  }

  return response.json();
}

/**
 * ====================================
 * Queries (PUT requests)
 * ====================================
 */

export const updateUrl = async (payload: urlPayload, id:string) => {
  const response = await fetch(
    `${API_BASE_URL}/update-url/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update URL");
  }

  return response.json();
}