// Shared expiry-status helpers for the Expiry + Inventory Analytics UI.

export const EXPIRY_SOON_THRESHOLD_DAYS = 30;

export const EXPIRY_STATUS = {
    EXPIRED: "Expired",
    EXPIRING_SOON: "Expiring Soon",
    SAFE: "Safe",
};

// Whole-day difference between today and the given expiry date.
// Negative = already expired, 0 = expires today.
export const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return "Not Available";

    const days = getDaysUntilExpiry(expiryDate);

    if (days < 0) {
        return EXPIRY_STATUS.EXPIRED;
    }

    if (days <= EXPIRY_SOON_THRESHOLD_DAYS) {
        return EXPIRY_STATUS.EXPIRING_SOON;
    }

    return EXPIRY_STATUS.SAFE;
};

// Maps a status to the CSS class used for the coloured badge/chart segment.
export const getExpiryStatusClass = (status) => {
    switch (status) {
        case EXPIRY_STATUS.EXPIRED:
            return "expiry-expired";
        case EXPIRY_STATUS.EXPIRING_SOON:
            return "expiry-soon";
        default:
            return "expiry-safe";
    }
};

export const getExpiryStatusColor = (status) => {
    switch (status) {
        case EXPIRY_STATUS.EXPIRED:
            return "#dc2626";
        case EXPIRY_STATUS.EXPIRING_SOON:
            return "#b45309";
        default:
            return "#15803d";
    }
};

export const formatExpiryDate = (dateStr) => {
    if (!dateStr) return "—";

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};
