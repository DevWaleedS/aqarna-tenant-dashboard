"use client";

import ValidateForm from "./form-validation/validate-form";

interface EditProfileContentProps {
	userId: string;
	isEditMode: boolean;
}

const EditProfileContent = ({
	userId,
	isEditMode,
}: EditProfileContentProps) => {
	return <ValidateForm userId={userId} isEditMode={isEditMode} />;
};

export default EditProfileContent;
