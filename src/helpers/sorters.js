const StringComparer = (name) => (a, b) => {
    const valueA = ((a || {})[name] || '').toUpperCase();
    const valueB = ((b || {})[name] || '').toUpperCase();

    if (valueA < valueB) {
        return -1;
    }
    else if (valueA > valueB) {
        return 1;
    }

    return 0;
};

export default {
    StringComparer
};
