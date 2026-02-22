import ValidateForm from "./validate-form";

interface EditRoleContentProps {
	roleId: number;
}
const EditRole = ({ roleId }: EditRoleContentProps) => {
	return <ValidateForm roleId={roleId} />;
};
export default EditRole;
