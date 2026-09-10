"use client";

import dynamic from "next/dynamic";

export const MapCanvas = dynamic(() => import("./MapView"), { ssr: false });
