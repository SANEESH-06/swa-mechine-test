
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getProducts } from "@/lib/api";
import ProductCardImage from "@/components/products/product-card-image";

type ProductImage = {
    image: string;
    alt_text?: string | null;
};

type ProductVariant = {
    is_primary?: boolean;
    price?: number | string;
    actual_price?: number | string;
    images?: ProductImage[];
};

type Product = {
    id?: string;
    uuid?: string;
    name?: string;
    price?: number | string;
    selling_price?: number | string;
    images?: string[];
    image?: string;
    description?: string;
    product_category?: string;
    product_images?: string | ProductImage[];
    variants?: ProductVariant[];
    specifications?: { name: string; value: string | number }[];
};

function ProductGridSkeleton() {
    return (
        <div
            aria-label="Loading products"
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
            {Array.from({ length: 10 }, (_, index) => (
                <article
                    key={index}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                    <div className="aspect-square animate-pulse bg-gray-200" />
                    <div className="space-y-3 p-3 sm:p-4">
                        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                    </div>
                </article>
            ))}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
                    <div className="mx-auto max-w-7xl text-sm text-gray-500">
                        <div className="mb-8 space-y-3" aria-hidden="true">
                            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        </div>
                        <ProductGridSkeleton />
                    </div>
                </main>
            }
        >
            <ProductListing />
        </Suspense>
    );
}

async function ProductListing() {
    await connection();

    let products: Product[] = [];

    try {
        const result = await getProducts();

        products = Array.isArray(result)
            ? result
            : result?.results ?? result?.products ?? [];
    } catch (error) {
        console.error("Products API error:", error);
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="text-sm text-gray-500">
                        Home / Products
                    </p>

                    <h1 className="mt-3 text-3xl font-bold text-gray-900">
                        All Products
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {products.length} products available
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
                        <h2 className="text-lg font-semibold">
                            No products found
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Check the API endpoint and response structure.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product, index) => {
                            const id = product.id ?? product.uuid;
                            const primaryVariant =
                                product.variants?.find((variant) => variant.is_primary) ??
                                product.variants?.[0];
                            const nestedImage = primaryVariant?.images?.find(
                                (item) => item.image
                            )?.image;
                            const productImage = Array.isArray(product.product_images)
                                ? product.product_images.find((item) => item.image)?.image
                                : product.product_images;
                            const image = nestedImage ?? productImage ?? product.images?.[0] ?? product.image;
                            const price =
                                product.specifications?.find(
                                    (specification) => specification.name === "custom.total_price"
                                )?.value ??
                                primaryVariant?.price ??
                                primaryVariant?.actual_price ??
                                product.selling_price ??
                                product.price;
                            const formattedPrice =
                                price == null
                                    ? "Price unavailable"
                                    : `₹${Number(price).toLocaleString("en-IN", {
                                        maximumFractionDigits: 2,
                                    })}`;

                            return (
                                <article
                                    key={id ?? index}
                                    className="overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
                                >
                                    <Link
                                        href={id ? `/product/${id}` : "/product"}
                                        className="block"
                                    >
                                        <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-100">
                                            {image ? (
                                                <ProductCardImage
                                                    src={image}
                                                    alt={product.name ?? "Product"}
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    No image available
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3 sm:p-4">
                                            <h2 className="line-clamp-2 min-h-10 text-sm font-medium text-gray-900">
                                                {product.name ?? "Product Name"}
                                            </h2>

                                            <p className="mt-2 text-base font-bold text-gray-900">
                                                {formattedPrice}
                                            </p>

                                            {product.product_category && (
                                                <p className="mt-1 truncate text-xs text-gray-500">
                                                    {product.product_category}
                                                </p>
                                            )}

                                            <span className="mt-3 block text-sm font-medium text-gray-700">
                                                View Details →
                                            </span>
                                        </div>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
