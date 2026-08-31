import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/api';
import { Stars } from './Reveal';

export const ProductCard = ({ product, className = '' }) => {
  const { addItem } = useCart();
  const discount = product.compare_at
    ? Math.round((1 - product.price / product.compare_at) * 100)
    : 0;

  const quickAdd = (e) => {
    e.preventDefault();
    addItem(product, product.sizes?.includes('M') ? 'M' : product.sizes?.[0] || 'One Size');
    toast.success(`${product.title} added to bag`);
  };

  return (
    <Link
      to={`/products/${product.handle}`}
      className={`group block ${className}`}
      data-testid={`product-card-${product.handle}`}
    >
      <div className="relative overflow-hidden bg-white aspect-[3/4]">
        <img
          src={product.images?.[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.bestseller && (
            <span className="bg-[#2D2D2D] text-[#F7F3F0] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
              Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#E8B4B8] text-[#2D2D2D] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
              Save {discount}%
            </span>
          )}
        </div>
        <button
          onClick={quickAdd}
          data-testid={`quick-add-${product.handle}`}
          aria-label={`Quick add ${product.title}`}
          className="absolute bottom-4 right-4 h-11 w-11 rounded-full bg-[#F7F3F0] text-[#2D2D2D] flex items-center justify-center opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#E8B4B8]"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>
      <div className="pt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg leading-tight min-h-[2.5rem] text-[#2D2D2D] group-hover:text-[#c98d92] transition-colors duration-300">
            {product.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <Stars rating={product.rating} size={11} />
            <span className="text-xs text-[#2D2D2D]/50">({product.reviews_count})</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-[#2D2D2D]">{formatPrice(product.price)}</p>
          {product.compare_at && (
            <p className="text-sm text-[#2D2D2D]/40 line-through">{formatPrice(product.compare_at)}</p>
          )}
        </div>
      </div>
    </Link>
  );
};
