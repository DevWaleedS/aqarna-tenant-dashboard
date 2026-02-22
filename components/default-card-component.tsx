import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ButtonCardProps {
	className?: string;
	title: string;
	component?: ReactNode;
	children: ReactNode;
}

const DefaultCardComponent = ({
	className,
	title,
	component,
	children,
}: ButtonCardProps) => {
	return (
		<Card className={cn("card h-full p-0! block! border-0 ", className)}>
			<CardHeader className='flex justify-between items-baseline border-b border-neutral-200 dark:border-slate-600 py-4! px-6'>
				<CardTitle className='text-lg font-semibold'>{title}</CardTitle>
				{component}
			</CardHeader>
			<CardContent className='card-body p-6'>{children}</CardContent>
		</Card>
	);
};
export default DefaultCardComponent;
