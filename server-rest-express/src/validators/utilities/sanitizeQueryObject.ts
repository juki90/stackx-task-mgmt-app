export default (value: string): boolean => {
    try {
        const parsedValue = JSON.parse(value);

        if (typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
            return parsedValue;
        }

        return null;
    } catch (err) {
        return null;
    }
};
