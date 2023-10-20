export default (
    body: { errors: { field: string; message: string }[] },
    fieldName: string
): string => body?.errors?.find(error => error?.field === fieldName)?.message;
