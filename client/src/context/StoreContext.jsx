import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const FREE_SHIPPING_THRESHOLD = 150;

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read("nova-cart", []));
  const [wishlist, setWishlist] = useState(() => read("nova-wishlist", []));
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => write("nova-cart", cart), [cart]);
  useEffect(() => write("nova-wishlist", wishlist), [wishlist]);

  const toast = (message, type = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const addToCart = (product, qty = 1, silent = false) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id);
      if (found) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          qty: Math.min(qty, 99),
        },
      ];
    });
    if (!silent) toast(`${product.name} added to cart`);
  };

  const updateQty = (productId, qty) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) =>
            i.productId === productId ? { ...i, qty: Math.min(qty, 99) } : i
          )
    );
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((i) => i.productId !== productId));

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    const has = wishlist.some((p) => p.id === product.id);
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
    toast(has ? "Removed from wishlist" : `${product.name} saved to wishlist`, has ? "info" : "success");
  };

  const inWishlist = (id) => wishlist.some((p) => p.id === id);

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = cart.length === 0 ? 0 : freeShipping ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const value = {
    cart,
    wishlist,
    toasts,
    cartCount,
    subtotal,
    shipping,
    tax,
    total,
    freeShipping,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    inWishlist,
    toast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
