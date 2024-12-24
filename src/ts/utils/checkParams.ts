// Function to validate an ID
export function validateId(id: any, paramName: string): number {
    const parsedId = Number(id);
    if (isNaN(parsedId) || parsedId < 1 || !Number.isInteger(parsedId)) 
        throw new Error(`Invalid ${paramName}: must be a positive integer`);
    return parsedId;
}