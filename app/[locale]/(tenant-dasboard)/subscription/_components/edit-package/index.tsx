import ValidateForm from "./form-validation/validate-form";

interface EditPackageProps {
	packageId: string;
}

const EditPackage = ({ packageId }: EditPackageProps) => {
	return <ValidateForm packageId={packageId} />;
};

export default EditPackage;
