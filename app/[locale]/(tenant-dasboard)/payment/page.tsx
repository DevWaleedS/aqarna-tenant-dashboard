"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import LoadingSkeleton from "@/components/loading-skeleton";
import PagesDialog from "../../../../components/dailogs/pages-dialog";
import SubmitPaymentForm from "./_components/submitPaymentForm/validate-form";

const PaymentPageContent = () => {
	const t = useTranslations("payment");
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";

	return (
		<>
			<PagesDialog
				isPaymentPage
				className='max-w-5xl!'
				pageTitle={t("title")}
				defaultOpen>
				<SubmitPaymentForm token={token} />
			</PagesDialog>
		</>
	);
};

const PaymentPage = () => {
	const t = useTranslations("loading-text");

	return (
		<Suspense
			fallback={<LoadingSkeleton height='h-64' text={t("loading-text")} />}>
			<PaymentPageContent />
		</Suspense>
	);
};

export default PaymentPage;
