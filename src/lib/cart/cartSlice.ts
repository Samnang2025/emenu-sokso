import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/model';

const initialState: CartState = {
  items: [],
  totalItems: 0.00,
  totalPrice: 0.00,
};

const roundToTwoDecimals = (num: number) => {
  return parseFloat(num.toFixed(2));
};

const getItemUnitPrice = (item: CartItem, qty: number) => {
  if (item.qty_prices && item.qty_prices.length > 0) {
    for (const qp of item.qty_prices) {
      const min = parseFloat(qp.min_qty as any);
      const max = qp.max_qty ? parseFloat(qp.max_qty as any) : null;
      
      let unitMatches = false;
      if (!qp.unit_id) {
        unitMatches = true;
      } else if (item.unit_id) {
        unitMatches = (qp.unit_id == item.unit_id);
      } else {
        unitMatches = false;
      }

      if (unitMatches && qty >= min && (max === null || qty <= max)) {
        return parseFloat(qp.price as any);
      }
    }
  }
  return item.orig_price !== undefined ? item.orig_price : (item.promo_price || item.price);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, promo_price, price, comment, unit_id } = action.payload;
      const cartItemId = `${id}-${unit_id || ''}-${comment || ''}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);
      if (existingItem) {
        existingItem.quantity += 1;
        const activePrice = getItemUnitPrice(existingItem, existingItem.quantity);
        existingItem.price = activePrice;
        existingItem.subtotalPrice = roundToTwoDecimals(existingItem.quantity * activePrice);
      } else {
        const orig_price = action.payload.orig_price || price;
        const newItem = {
          ...action.payload,
          orig_price,
          cartItemId,
          quantity: 1,
        };
        const activePrice = getItemUnitPrice(newItem, 1);
        newItem.price = activePrice;
        newItem.subtotalPrice = roundToTwoDecimals(1 * activePrice);
        state.items.push(newItem);
      }
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
      state.totalPrice = roundToTwoDecimals(
        state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
      ); // Update totalPrice
    },
    removeFromCart: (state, action: PayloadAction<{ cartItemId?: string; itemId?: string }>) => {
      const { cartItemId, itemId } = action.payload;
      const targetId = cartItemId || itemId;
      const existingItem = state.items.find(item => (item.cartItemId || item.id) === targetId);
      if (existingItem) {
        state.items = state.items.filter(item => (item.cartItemId || item.id) !== targetId);
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
        state.totalPrice = roundToTwoDecimals(
          state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
        ); // Update totalPrice
      }
    },
    updateCartItem: (state, action: PayloadAction<{ cartItemId?: string; itemId?: string; quantity: number }>) => {
      const { cartItemId, itemId, quantity } = action.payload;
      const targetId = cartItemId || itemId;
      const existingItem = state.items.find(item => (item.cartItemId || item.id) === targetId);
      if (existingItem) {
        existingItem.quantity = quantity;
        const activePrice = getItemUnitPrice(existingItem, quantity);
        existingItem.price = activePrice;
        existingItem.subtotalPrice = roundToTwoDecimals(quantity * activePrice);
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
        state.totalPrice = roundToTwoDecimals(
          state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
        ); // Update totalPrice
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    }
  },
});

export const { addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
