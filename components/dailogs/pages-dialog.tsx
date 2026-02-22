import { cn } from "@/lib/utils";
import { ReactNode } from "react";

import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogOverlay,
	DialogTitle,
} from "@/components/ui/dialog";

import DefaultCardComponent from "../default-card-component";
import { useRouter } from "next/navigation";

interface PagesDialogProps {
	isPaymentPage?: boolean;
	className?: string;
	button?: ReactNode;
	children: ReactNode;
	pageTitle: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
}

const PagesDialog = ({
	isPaymentPage,
	className,
	button,
	pageTitle,
	children,
	open,
	onOpenChange,
	defaultOpen,
}: PagesDialogProps) => {
	const router = useRouter();

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && isPaymentPage) {
			router.back();
		}
		onOpenChange?.(newOpen);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			defaultOpen={defaultOpen}>
			{button && <DialogTrigger asChild>{button}</DialogTrigger>}
			{isPaymentPage && (
				<DialogOverlay
					onClick={() => router.back()}
					className='bg-white/70 backdrop-blur-[20px]'
				/>
			)}

			<DialogContent
				className={cn(
					"p-0 max-w-3xl! overflow-y-auto max-h-screen",
					className,
				)}>
				<DialogTitle asChild>
					{pageTitle ? (
						<DefaultCardComponent title={pageTitle}>
							{children}
						</DefaultCardComponent>
					) : (
						children
					)}
				</DialogTitle>
			</DialogContent>
		</Dialog>
	);
};

export default PagesDialog;
