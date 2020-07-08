import { ValidationOptions, registerDecorator, isFQDN, isIP } from "class-validator";

export function IsFqdnOrIp(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string): void {
        registerDecorator({
            name: 'IsFqdnOrIp',
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} must be either a FQDN or IP address`,
                ...validationOptions
            },
            validator: {
                validate(value: any): boolean {
                    return isFQDN(value) || isIP(value);
                },
            }
        });
    };
}