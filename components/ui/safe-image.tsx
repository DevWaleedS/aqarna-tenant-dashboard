"use client";

import Image from "next/image";
import userImg from "@/public/assets/images/user.png";
import React from "react";

type Props = React.ComponentProps<typeof Image> & {
	src?: unknown;
};

const isValidSrc = (src: unknown) => {
	if (!src) return false;
	if (typeof src === "string") {
		if (src === "0") return false;
		return (
			src.startsWith("/") || src.startsWith("http") || src.startsWith("data:")
		);
	}
	if (typeof src === "object") return true; // StaticImageData or imported image
	return false;
};

export default function SafeImage({ src, alt = "", ...props }: Props) {
	if (isValidSrc(src)) {
		// @ts-ignore allow StaticImageData
		return <Image src={src as any} alt={alt} {...props} />;
	}

	// Fallback to a local placeholder (uses absolute path from public/)
	const fallback = userImg.src ?? "/assets/images/user.png";
	// Render an img element to avoid next/image parsing when src is invalid
	const { width, height, className } = props as any;
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={fallback}
			alt={alt}
			width={width as any}
			height={height as any}
			className={className}
		/>
	);
}
