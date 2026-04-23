let pending = null;
export const setScannedQR = (data) => { pending = data; };
export const popScannedQR = () => { const d = pending; pending = null; return d; };
