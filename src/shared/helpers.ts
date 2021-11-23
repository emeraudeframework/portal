import jwtDecode, {JwtPayload} from "jwt-decode";
import {AxiosError} from "axios";
import {strings} from "@/shared/strings";


export function newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function decodeAccessToken(token: string): JwtPayload {
    return jwtDecode<JwtPayload>(token);
}

export function validateAccessTokenExpiration(token: string): boolean {
    const decodedToken = decodeAccessToken(token);
    return Date.now() < ((decodedToken.exp || 0) * 1000);
}

export function isUrlAbsolute(url: string): boolean {
    const regex = new RegExp('^(?:[a-z]+:)?//', 'i');
    return regex.test(url);
}

export const normalizeRoute = function (route: string): string {
    if (route && route.trim() !== '') {
        route = route.toLowerCase().trim();
        if (route.endsWith('/')) {
            route = route.substr(0, route.length - 1);
        }
    }

    return route;
}

export function handleRequestError(error: any, handler: (message: string) => void) {
    try {
        const errors = getMessagesFromErrorResponse(error as AxiosError);
        if (errors && errors.length) {
            errors.forEach((x: string) => handler(x));
        }
        else {
            console.log(error);
            handler(strings.general.unexpectedErrorMessage);
        }
    }
    catch (e) {
        console.log(e);
        handler(strings.general.unexpectedErrorMessage);
    }
}

export function getMessagesFromErrorResponse(error: AxiosError) {
    if (!error.response) {
        return [];
    }

    const mappedErrorsObject = error.response.data?.errors || error.response.data;
    const errors: Array<string> = [];
    const mappedErrors = Object.keys(mappedErrorsObject).map(x => mappedErrorsObject[x]);
    for (const mappedErrorList of mappedErrors) {
        if (Array.isArray(mappedErrorList)) {
            mappedErrorList.forEach((x: string) => errors.push(x));
        }
    }

    return errors;
}

export function encodeHtml(htmlString: string): string {
    const buf = [];

    for (let i=htmlString.length-1;i>=0;i--) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        buf.unshift(['&#', htmlString[i].charCodeAt(), ';'].join(''));
    }

    return buf.join('');
}

export function decodeHtml(htmlString: string): string {
    return htmlString.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}

export function isKeyValid(event: Event): boolean {
    let keyEvent = event as KeyboardEvent;
    if (!keyEvent) {
        keyEvent = window.event as KeyboardEvent;
    }

    const charCode = (keyEvent?.which) ? keyEvent.which : keyEvent.code;
    if ((charCode >= 48 && charCode <= 57) ||
        (charCode >= 65 && charCode <= 90) ||
        (charCode >= 97 && charCode <= 122) ||
        charCode === 95 || charCode === 32) {
        return true;
    }
    else {
        event.preventDefault();
        return false;
    }
}

export function transformKeyInput(event: Event): string {
    const target = event.target as HTMLInputElement;
    let input = target.value.toUpperCase();
    input = input.replace(/ /g, "_");

    return input;
}