// Sok Thean popup Component
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Menu } from "@/types/model";
import numeral from "numeral";
import { useTranslation } from "@/lib/i18n"; //AKK Translation
import { createPortal } from "react-dom";

type PropType = {
  cartItem: Menu;
  cur: any;
  onAdd: (comment: string) => void;
  isOpen: boolean;
  onClose: () => void;
  imgUrl: string;
};

const FoodItemModal: React.FC<PropType> = ({
  cartItem,
  cur,
  onAdd,
  isOpen,
  onClose,
  imgUrl,
}) => {
  const [comment, setComment] = useState("");
  const [spicyLevel, setSpicyLevel] = useState("");
  const [chiliLevel, setChiliLevel] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  //AKK Translation
  const { locale, t } = useTranslation();

  const { name, second_name, imagePath, price, promo_price, brand, type, subcategory } = cartItem;
  const isSpicyNoodle = 
    type?.includes("មីហឹរ") || 
    subcategory?.includes("មីហឹរ") || 
    brand?.includes("មីហឹរ") ||
    name?.includes("មីហឹរ") ||
    second_name?.includes("មីហឹរ") ||
    (cartItem as any).category === "មីហឹរ" ||
    (cartItem as any).category?.includes("មីហឹរ");

  const isPapayaSalad = 
    type?.includes("បុកល្ហុង") || 
    subcategory?.includes("បុកល្ហុង") || 
    brand?.includes("បុកល្ហុង") ||
    name?.includes("បុកល្ហុង") ||
    second_name?.includes("បុកល្ហុង") ||
    (cartItem as any).category === "បុកល្ហុង" ||
    (cartItem as any).category?.includes("បុកល្ហុង");

  const displayName = (locale === 'en' && second_name) ? second_name : name;
  //End AKK Translation
  const real_price = numeral(promo_price).format("0.[00]");
  const actual_price = numeral(price).format("0.[00]");

  if (!isOpen || !mounted) return null;

  const handleAdd = () => {
    let finalComment = comment;
    const selections = [];
    
    if (isSpicyNoodle) {
      if (spicyLevel) selections.push(`កម្រិត: ${spicyLevel}`);
    } else if (isPapayaSalad) {
      if (chiliLevel) selections.push(`ម្ទេស: ${chiliLevel}`);
    }
    
    if (selections.length > 0) {
      const customization = `[${selections.join(", ")}]`;
      finalComment = comment ? `${customization} ${comment}` : customization;
    }
    
    onAdd(finalComment);
    setComment(""); // Reset comment after adding
    setSpicyLevel(""); // Reset spicy
    setChiliLevel(""); // Reset chili
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-90 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="w-full h-60 relative">
          <img
            src={`${imgUrl}${imagePath}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="p-3">
          <div className="flex flex-row justify-between items-center gap-2 mb-4">
            <h2 className="text-2xl font-dangrek font-bold text-black leading-tight">
              {displayName}
            </h2>
            <div className="flex flex-col items-end shrink-0 pt-1">
              <span className="text-2xl text-start font-bold text-orange-600">
                {cur || "$"}{promo_price ? real_price : actual_price}
              </span>
              {promo_price && (
                <span className="text-sm text-gray-400 line-through">
                  {cur || "$"}{actual_price}
                </span>
              )}
            </div>
          </div>
           
        
          {/* Spicy Level for មីហឹរ */}
          {isSpicyNoodle && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-battambong font-semibold text-gray-700 mb-2">
                  {t("spicyLevelLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["អត់ហិរ", "កម្រិត 1", "កម្រិត 2", "កម្រិត 3", "កម្រិត 4", "កម្រិត 5", "កម្រិត 6", "កម្រិត 7", "កម្រិត 8", "កម្រិត 9"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSpicyLevel(spicyLevel === level ? "" : level)}
                      className={`px-4 py-2 rounded-full text-sm font-battambong transition-all ${
                        spicyLevel === level
                          ? "bg-orange text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chili Level for បុកល្ហុង */}
          {isPapayaSalad && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-battambong font-semibold text-gray-700 mb-2">
                  {t("chiliLevelLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["អត់ម្ទេស", "1 គ្រាប់", "2 គ្រាប់", "3 គ្រាប់", "4 គ្រាប់", "5 គ្រាប់", "6 គ្រាប់", "7 គ្រាប់", "8 គ្រាប់", "9 គ្រាប់", "10 គ្រាប់"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setChiliLevel(chiliLevel === level ? "" : level)}
                      className={`px-4 py-2 rounded-full text-sm font-battambong transition-all ${
                        chiliLevel === level
                          ? "bg-orange text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comment Field */}
          <div className="mb-2">
            <label htmlFor="item-comment" className="block text-sm font-battambong font-semibold text-gray-700 mb-2">
              {t("optionalCommentLabel")}
            </label>
            <textarea
              id="item-comment"
              rows={1}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:border-orange focus:ring-4 focus:ring-orange/10 outline-none transition-all duration-300 resize-none text-gray-800 placeholder:text-gray-400 font-battambong shadow-inner hover:shadow-md"
              placeholder={t("commentPlaceholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="w-full bg-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange/90 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-battambong" style={{"fontWeight": "normal"}}>{t("addToBasketLabel")}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FoodItemModal;
