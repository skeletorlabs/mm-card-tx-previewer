export function shortAddress(address: string, size?: number) {
  return address
    ? address?.slice(0, size ? size : 4) +
        "******" +
        address?.slice(address.length - (size ? size : 4), address.length)
    : "";
}
