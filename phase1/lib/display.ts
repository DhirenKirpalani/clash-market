

// Format Data Display
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
}

export const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value / 100)
}

export const getPnLColor = (pnl: number) => {
    if (pnl > 0) return "text-green-400"
    if (pnl < 0) return "text-red-400"
    return "text-gray-400"
}

export const getPnLSign = (pnl: number) => {
    if (pnl > 0) return "+"
    return "-"
}