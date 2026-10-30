
import axios from "axios";

const API_URL = "https://b2cqa.bufferbytes.in";

const VENDOR_ID = process.env.B2C_VENDOR_ID;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "x-vendor-id": VENDOR_ID,
    },
});

export async function getProductDetails(id: string) {
    try {
        const response = await api.get(
            `/customer/products/${id}/`
        );

        const result = response.data;

        if (result.status !== "success") {
            throw new Error("Product API request failed");
        }

        return result.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "API error:",
                error.response?.status,
                error.response?.data
            );
        }

        throw error;
    }
}

export async function getProducts() {
    try {
        const response = await api.get("/customer/products/");
        const result = response.data;

        if (result.status !== "success") {
            throw new Error("Products API request failed");
        }

        return result.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "API error:",
                error.response?.status,
                error.response?.data
            );
        }

        throw error;
    }
}
