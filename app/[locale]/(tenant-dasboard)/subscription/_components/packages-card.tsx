import { SquarePen, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

import EditPackage from "./edit-package";
import { Separator } from "@/components/ui/separator";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";

interface CardProps {
	packageId: string;
	colorStyle: string;
	priceType: string;
	title: string;
	description: string;
	price: string;
	features: string[];
	maxProperties: number;
	maxUnits: number;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

const PackagesCard = ({
	packageId,
	colorStyle,
	priceType,
	price,
	title,
	description,
	features,
	maxProperties,
	maxUnits,
	onDelete,
	isDeleting,
}: CardProps) => {
	const t = useTranslations("central.packages");
	const conformMessages = useTranslations("confirmation-dialog");

	const handleDelete = () => {
		onDelete(packageId);
	};

	return (
		<div
			className={`card  h-full rounded-xl border-0 overflow-hidden p-0! !bg-${colorStyle}/10 dark:bg-${colorStyle}/20`}>
			<div className='card-body p-6'>
				<div
					className={`inline-flex items-center justify-center mb-4 text-${colorStyle}`}>
					<span className='text-3xl font-bold ml-2'>{price}</span>
					<span className={`text-${colorStyle}`}>
						{priceType === "monthly_price"
							? t("monthly_prices_symbol")
							: t("yearly_prices_symbol")}
					</span>
				</div>

				<Separator className='my-3 border-neutral-200! dark:border-slate-600' />

				<h6 className='mb-2 text-lg font-semibold'>{title}</h6>

				<p className='card-text mb-4 text-neutral-500 dark:text-neutral-300 line-clamp-2'>
					{description}
				</p>

				<div className='mb-4'>
					<div className='flex items-center gap-2 mb-2'>
						<span className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
							{t("max_properties")}:
						</span>
						<span className='text-sm font-semibold'>{maxProperties}</span>
					</div>
					<div className='flex items-center gap-2'>
						<span className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
							{t("max_units")}:
						</span>
						<span className='text-sm font-semibold'>{maxUnits}</span>
					</div>
				</div>

				<h6 className='text-sm font-semibold mb-2'>{t("features")}:</h6>
				<ul className='space-y-1 mb-4 min-h-30'>
					{features.slice(0, 4).map((feature, index) => (
						<li
							key={index}
							className='text-sm text-neutral-500 dark:text-neutral-300 flex items-center gap-2'>
							<span
								className={`w-2 h-2 rounded-full bg-${colorStyle} shrink-0`}></span>
							<span className='line-clamp-1'>{feature}</span>
						</li>
					))}
					{features.length > 4 && (
						<li className='text-sm text-neutral-400 dark:text-neutral-500'>
							+{features.length - 4} more...
						</li>
					)}
				</ul>

				<Separator className='my-4 border-neutral-200! dark:border-slate-600' />

				<div className='flex h-5 items-center justify-center'>
					<PagesDialog
						button={
							<Button
								type='button'
								className='btn px-2.5! py-2.5! flex items-center bg-primary/15 dark:bg-primary-600/25 text-primary dark:text-primary-400 border-primary-100 hover:bg-primary/25 hover:dark:bg-primary-600/30 border hover:border-primary-200'>
								<SquarePen className='w-5 h-5 shrink-0' />
							</Button>
						}
						pageTitle={t("edit_package")}>
						<EditPackage packageId={packageId} />
					</PagesDialog>

					<Separator
						className='mx-3 border border-neutral-200 dark:border-slate-600'
						decorative
						orientation='vertical'
					/>

					<ConfirmationDialog
						type='danger'
						title={conformMessages("title")}
						icon={<Trash2 className='w-5 h-5' />}
						trigger={
							<Button
								type='button'
								disabled={isDeleting}
								className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
								{isDeleting ? (
									<Loader2 className='w-5 h-5 shrink-0 animate-spin' />
								) : (
									<Trash2 className='w-5 h-5 shrink-0' />
								)}
							</Button>
						}
						onConfirm={handleDelete}>
						{conformMessages("message")}
					</ConfirmationDialog>
				</div>
			</div>
		</div>
	);
};

export default PackagesCard;
