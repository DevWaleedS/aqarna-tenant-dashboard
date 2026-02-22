import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

interface ConfirmationDialogProps {
	type: "danger" | "warning" | "info";
	title: string;
	icon: ReactNode;
	trigger: ReactNode;
	children: ReactNode;
	onConfirm?: () => void;
	onCancel?: () => void;
	confirmText?: string;
	cancelText?: string;
}

const typeStyles = {
	danger: {
		bg: "bg-red-100 dark:bg-red-600/25",
		text: "text-red-600 dark:text-red-400",
		border: "border-red-100 dark:border-red-600/50",
		buttonBorder: "border-red-600",
		buttonHover: "hover:bg-red-600/20",
	},
	warning: {
		bg: "bg-yellow-100 dark:bg-yellow-600/25",
		text: "text-yellow-600 dark:text-yellow-400",
		border: "border-yellow-100 dark:border-yellow-600/50",
		buttonBorder: "border-yellow-600",
		buttonHover: "hover:bg-yellow-600/20",
	},
	info: {
		bg: "bg-blue-100 dark:bg-blue-600/25",
		text: "text-blue-600 dark:text-blue-400",
		border: "border-blue-100 dark:border-blue-600/50",
		buttonBorder: "border-blue-600",
		buttonHover: "hover:bg-blue-600/20",
	},
};

const ConfirmationDialog = ({
	type,
	title,
	icon,
	trigger,
	children,
	onConfirm,
	onCancel,
	confirmText,
	cancelText,
}: ConfirmationDialogProps) => {
	const t = useTranslations("confirmation-dialog");
	const styles = typeStyles[type];

	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent
				className={cn("max-w-2xl border-0 p-0 overflow-hidden", styles.bg)}>
				<div
					className={cn("px-6 py-4 font-semibold", styles.text)}
					role='alert'>
					<div className='flex items-start justify-between text-lg'>
						<div className='flex items-start gap-4'>
							<div className='w-5 h-5 mt-1.5 shrink-0'>{icon}</div>
							<div>
								<DialogTitle
									className={cn("font-semibold text-lg", styles.text)}>
									{title}
								</DialogTitle>
								<div className={cn("font-medium text-sm mt-2", styles.text)}>
									{children}
								</div>
							</div>
						</div>
					</div>

					<Separator className='my-6 border-neutral-200 dark:border-slate-600' />

					<div className='flex justify-center gap-4'>
						<Button
							type='button'
							onClick={handleConfirm}
							className={cn("h-12 text-base px-10 py-3 rounded-lg")}>
							{confirmText || t("confirm-button-text")}
						</Button>

						<DialogClose asChild>
							<Button
								variant='outline'
								type='button'
								onClick={handleCancel}
								className={cn(
									"h-12 border bg-transparent text-base px-14 py-2.75 rounded-lg",
									`border-${
										type === "danger"
											? "red"
											: type === "warning"
											? "yellow"
											: "blue"
									}-600`,
									styles.text,
									styles.buttonHover
								)}>
								{cancelText || t("cancel-button-text")}
							</Button>
						</DialogClose>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationDialog;
