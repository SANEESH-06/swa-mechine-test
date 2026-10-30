
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Truck,
    ShieldCheck,
    PackageCheck,
} from "lucide-react";

type ProductImage = { image: string; alt_text?: string | null };
type ProductAttribute = { name: string; value: string };
type ProductVariant = {
    id: string;
    sku?: string;
    price?: number | string;
    actual_price?: number | string;
    stock?: number;
    is_primary?: boolean;
    attributes?: ProductAttribute[];
    images?: ProductImage[];
};
type Product = {
    id: string;
    name?: string;
    description?: string;
    product_category?: string;
    is_next_day_shipping_available?: boolean;
    specifications?: { name: string; value: string | number }[];
    product_images?: ProductImage[];
    variants?: ProductVariant[];
};

function formatPrice(value: string | number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value));
}

function getAttributeGroups(variants: ProductVariant[]) {
    const groups = new Map<string, string[]>();

    for (const variant of variants) {
        for (const attribute of variant.attributes ?? []) {
            const values = groups.get(attribute.name) ?? [];
            if (!values.includes(attribute.value)) values.push(attribute.value);
            groups.set(attribute.name, values);
        }
    }

    return Array.from(groups, ([name, values]) => ({ name, values })).filter(
        (group) => group.values.length > 1
    );
}

function ProductDetailsSkeleton() {
    return (
        <main
            aria-label="Loading product details"
            aria-busy="true"
            className="min-h-screen bg-[#f7f8fa] px-3 py-5 text-gray-900 sm:px-6 sm:py-8"
        >
            <div className="mx-auto max-w-6xl rounded-md border border-gray-200 bg-white p-4 sm:p-6">
                <div className="mb-6 h-3 w-56 animate-pulse rounded bg-gray-200" />

                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
                    <div>
                        <div className="aspect-4/3 animate-pulse rounded-md bg-gray-200" />
                        <div className="mt-3 grid grid-cols-4 gap-3">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div
                                    key={index}
                                    className="aspect-square animate-pulse rounded bg-gray-100"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-6 w-20 animate-pulse rounded bg-gray-100" />
                        <div className="h-7 w-4/5 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                        <div className="h-8 w-36 animate-pulse rounded bg-gray-200" />
                        <div className="border-t border-gray-100 pt-4">
                            <div className="mb-3 h-4 w-20 animate-pulse rounded bg-gray-100" />
                            <div className="flex gap-2">
                                {Array.from({ length: 4 }, (_, index) => (
                                    <div
                                        key={index}
                                        className="h-10 w-14 animate-pulse rounded border border-gray-100 bg-gray-50"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="h-10 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>

                <section className="mt-8 border-t border-gray-200 pt-5">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                    <div className="mt-4 space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
                    </div>
                </section>

                <section className="mt-8">
                    <div className="mb-3 h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-100 sm:grid-cols-2">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={index} className="flex justify-between bg-white px-3 py-4">
                                <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
                                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function ProductDetails() {
    return (
        <Suspense
            fallback={<ProductDetailsSkeleton />}
        >
            <ProductContent />
        </Suspense>
    );
}

function ProductContent() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [cartMessage, setCartMessage] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProduct() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
                if (!response.ok) throw new Error("Could not load this product.");

                const data = (await response.json()) as { product: Product };
                if (!active) return;

                const description = data.product.description
                    ? new DOMParser()
                        .parseFromString(data.product.description, "text/html")
                        .body.textContent?.trim() ?? ""
                    : "";
                const loadedProduct = { ...data.product, description };

                setProduct(loadedProduct);
                setSelectedVariantId(
                    loadedProduct.variants?.find((variant) => variant.is_primary)?.id ??
                    loadedProduct.variants?.[0]?.id ??
                    ""
                );
                setActiveImage(0);
            } catch {
                if (active) setError("Could not load this product. Please try again.");
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadProduct();
        return () => {
            active = false;
        };
    }, [id]);

    const variants = product?.variants ?? [];
    const selectedVariant =
        variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
    const variantImages = selectedVariant?.images?.filter((item) => item.image) ?? [];
    const productImages = product?.product_images?.filter((item) => item.image) ?? [];
    const images = variantImages.length > 0 ? variantImages : productImages;
    const image = images[activeImage % Math.max(images.length, 1)];
    const attributeGroups = getAttributeGroups(variants);
    const totalPrice = product?.specifications?.find(
        (specification) => specification.name === "custom.total_price"
    )?.value;
    const price = totalPrice ?? selectedVariant?.price ?? selectedVariant?.actual_price;
    const compareAtPrice = [selectedVariant?.price, selectedVariant?.actual_price]
        .filter((value): value is number | string => value != null)
        .map(Number)
        .filter((value) => value > Number(price))
        .sort((left, right) => right - left)[0];
    const specifications = [
        ...(product?.product_category
            ? [{ name: "Category", value: product.product_category }]
            : []),
        ...(selectedVariant?.sku
            ? [{ name: "Product Code", value: selectedVariant.sku }]
            : []),
        ...(selectedVariant?.stock != null
            ? [{ name: "Available Stock", value: selectedVariant.stock }]
            : []),
        ...(product?.specifications ?? [])
            .filter(({ name }) => !name.startsWith("global.") && name !== "custom.product_code")
            .map(({ name, value }) => ({
                name: name.replace(/^custom\./, "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
                value,
            })),
    ];

    function changeImage(direction: number) {
        if (images.length < 2) return;
        setActiveImage((current) => (current + direction + images.length) % images.length);
    }

    function addToCart() {
        setCartMessage(`Added ${quantity} item(s) to cart`);
    }

    function chooseAttribute(name: string, value: string) {
        const currentAttributes = selectedVariant?.attributes ?? [];
        const matchingVariants = variants.filter((variant) =>
            variant.attributes?.some(
                (attribute) => attribute.name === name && attribute.value === value
            )
        );
        const matchingVariant = matchingVariants.find((variant) =>
            currentAttributes.every((current) => {
                if (current.name === name) return true;
                const nextValue = variant.attributes?.find(
                    (attribute) => attribute.name === current.name
                )?.value;
                return nextValue == null || nextValue === current.value;
            })
        ) ?? matchingVariants[0];

        if (!matchingVariant) return;
        setSelectedVariantId(matchingVariant.id);
        setActiveImage(0);
        setCartMessage("");
    }

    if (loading) {
        return <ProductDetailsSkeleton />;
    }

    if (error || !product) {
        return (
            <main className="min-h-screen p-8">
                <p role="alert" className="text-sm text-red-700">
                    {error || "Product not found."}
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f8fa] px-3 py-5 text-gray-900 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-6xl rounded-md border border-gray-200 bg-white p-4 sm:p-6">
                {/* Breadcrumb */}
                <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <a href="/" className="hover:text-black">Home</a>
                    <span>/</span>
                    <a href="/product" className="hover:text-black">Products</a>
                    <span>/</span>
                    <span className="text-gray-800">{product.name ?? "Product"}</span>
                </nav>

                {/* Product section */}
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
                    {/* Images */}
                    <section>
                        <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                            {image ? (
                                <img
                                    src={image.image}
                                    alt={image.alt_text ?? product.name ?? "Product image"}
                                    className="h-full w-full object-contain p-4"
                                />
                            ) : (
                                <span className="text-sm text-gray-500">No product image available</span>
                            )}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => changeImage(-1)}
                                        aria-label="Previous image"
                                        className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => changeImage(1)}
                                        aria-label="Next image"
                                        className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">
                            {images.map((item, index) => (
                                <button
                                    key={`${item.image}-${index}`}
                                    onClick={() => setActiveImage(index)}
                                    aria-label={`View product image ${index + 1}`}
                                    className={`aspect-square overflow-hidden rounded border-2 bg-gray-100 p-2 ${activeImage === index ? "border-gray-800" : "border-transparent"}`}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.alt_text ?? `${product.name ?? "Product"} ${index + 1}`}
                                        className="h-full w-full object-contain"
                                    />
                                </button>
                            ))}
                        </div>}
                    </section>

                    {/* Product information */}
                    <section>
                        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${selectedVariant?.stock == null
                            ? "bg-gray-100 text-gray-700"
                            : selectedVariant.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {selectedVariant?.stock == null
                                ? "Stock unavailable"
                                : selectedVariant.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>

                        <h1 className="mt-2 text-2xl font-bold">{product.name ?? "Product"}</h1>
                        {selectedVariant?.sku && (
                            <p className="mt-1 text-xs text-gray-500">SKU: {selectedVariant.sku}</p>
                        )}

                        <p className="mt-3 text-2xl font-bold">
                            {price == null ? "Price unavailable" : formatPrice(price)}
                        </p>
                        {compareAtPrice != null && (
                            <p className="text-sm text-gray-500 line-through">
                                {formatPrice(compareAtPrice)}
                            </p>
                        )}

                        <hr className="my-4 border-gray-200" />

                        {attributeGroups.map((group) => (
                            <div key={group.name} className="mt-4">
                                <h2 className="mb-2 text-sm font-semibold">{group.name}</h2>
                                <div className="flex flex-wrap gap-2">
                                    {group.values.map((value) => {
                                        const selected = selectedVariant?.attributes?.some(
                                            (attribute) => attribute.name === group.name && attribute.value === value
                                        );

                                        return (
                                            <button
                                                key={value}
                                                onClick={() => chooseAttribute(group.name, value)}
                                                aria-pressed={selected}
                                                className={`rounded border px-3 py-2 text-xs ${selected
                                                    ? "border-gray-800 bg-gray-100 font-semibold"
                                                    : "border-gray-200 hover:border-gray-500"
                                                    }`}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Quantity */}
                        <div className="mt-4">
                            <h2 className="mb-2 text-sm font-semibold">Quantity</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    aria-label="Decrease quantity"
                                    className="flex h-9 w-9 items-center justify-center rounded border border-gray-200"
                                >
                                    <Minus size={15} />
                                </button>
                                <span className="flex h-9 min-w-12 items-center justify-center rounded border border-gray-200 text-sm">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    aria-label="Increase quantity"
                                    className="flex h-9 w-9 items-center justify-center rounded border border-gray-200"
                                >
                                    <Plus size={15} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={addToCart}
                            disabled={selectedVariant?.stock === 0}
                            className="mt-4 w-full rounded bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            Add to Cart
                        </button>

                        {cartMessage && (
                            <p role="status" className="mt-2 text-sm text-green-700">
                                {cartMessage}
                            </p>
                        )}

                        {/* Service benefits */}
                        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                            <div className="flex items-start gap-2">
                                <Truck size={19} className="shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold">Free Shipping</p>
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        {product.is_next_day_shipping_available ? "Next day available" : "Standard delivery"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <ShieldCheck size={19} className="shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold">Secure Payment</p>
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        100% secure
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <PackageCheck size={19} className="shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold">Easy Returns</p>
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        7 days return policy
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Description */}
                <section className="mt-8 border-t border-gray-200 pt-5">
                    <h2 className="text-sm font-bold">Description</h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {product.description || "No description available."}
                    </p>
                </section>

                {/* Specifications */}
                <section className="mt-8">
                    <h2 className="mb-3 text-sm font-bold">Specifications</h2>
                    {specifications.length > 0 ? (
                        <dl className="grid grid-cols-1 overflow-hidden rounded-md border border-gray-200 sm:grid-cols-2">
                            {specifications.map((specification, index) => (
                                <div
                                    key={`${specification.name}-${index}`}
                                    className={`grid grid-cols-2 gap-3 border-b border-gray-100 px-3 py-3 text-xs ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                >
                                    <dt className="text-gray-700">{specification.name}</dt>
                                    <dd className="font-medium text-gray-600">{specification.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-sm text-gray-500">No specifications available.</p>
                    )}
                </section>
            </div>
        </main>
    );
}