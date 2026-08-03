import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const backendUrl = process.env.BACKEND_API_URL;

        const query = new URLSearchParams();

        if (month) query.append("month", month);
        if (year) query.append("year", year);

        const response = await fetch(
            `${backendUrl}/LandingPage/landing/dashboard?${query.toString()}`
        );

        const data = await response.json();

        return NextResponse.json({
            error: false,
            data
        });

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            {
                error: true,
                message: err.message
            },
            {
                status: 500
            }
        );
    }
}