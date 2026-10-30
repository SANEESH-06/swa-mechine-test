import { NextResponse } from "next/server";
import { getProductDetails } from "@/lib/api";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const product = await getProductDetails(id);
        return NextResponse.json({ product });
    } catch {
        return NextResponse.json(
            { error: "Product could not be loaded" },
            { status: 502 }
        );
    }
}