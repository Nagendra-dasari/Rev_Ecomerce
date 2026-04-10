import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { setCart } from "../store/cartSlice";
import { formatCurrency } from "../utils/currency";
import { normalizeApiError } from "../utils/apiError";
import {
  addCartItem,
  addWishlistItem,
  createReview,
  getCart,
  getProduct,
  getReviews,
  getWishlist,
  removeWishlistItem,
  voteReviewHelpful,
} from "../services/storeApi";

const initialReview = { rating: 5, title: "", comment: "" };

function Product() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [reviewForm, setReviewForm] = useState(initialReview);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [productData, reviewData] = await Promise.all([getProduct(productId), getReviews(productId)]);
        if (!ignore) {
          setProduct(productData);
          setReviews(reviewData);
        }
        if (user) {
          const [wishlistData, cartData] = await Promise.all([getWishlist(), getCart()]);
          if (!ignore) {
            setWishlistIds(wishlistData.items.map((item) => item.id));
            dispatch(setCart(cartData));
          }
        }
      } catch (apiError) {
        if (!ignore) {
          setError(normalizeApiError(apiError, "Unable to load product"));
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [dispatch, productId, user]);

  const handleAddToCart = async () => {
    try {
      const cartData = await addCartItem({ product_id: productId, quantity: 1 });
      dispatch(setCart(cartData));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to add to cart"));
    }
  };

  const toggleWishlist = async () => {
    try {
      const wished = wishlistIds.includes(productId);
      const data = wished ? await removeWishlistItem(productId) : await addWishlistItem(productId);
      setWishlistIds(data.items.map((item) => item.id));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to update wishlist"));
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await createReview({ ...reviewForm, product_id: productId, rating: Number(reviewForm.rating) });
      const [productData, reviewData] = await Promise.all([getProduct(productId), getReviews(productId)]);
      setProduct(productData);
      setReviews(reviewData);
      setReviewForm(initialReview);
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to add review"));
    }
  };

  const helpfulVote = async (reviewId) => {
    try {
      const updated = await voteReviewHelpful(reviewId);
      setReviews((current) => current.map((item) => (item.id === reviewId ? updated : item)));
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Unable to vote review"));
    }
  };

  if (!product) {
    return <div className="page">Loading product...</div>;
  }

  return (
    <div className="page stack-lg">
      <section className="layout-grid">
        <article className="product-card">
          <img alt={product.name} src={product.image} />
          <div className="product-meta">
            <span className="tag">{product.category}</span>
            <span>
              {product.review_summary.average_rating} / 5 from {product.review_summary.total_reviews} reviews
            </span>
          </div>
          <h1>{product.name}</h1>
          <p className="muted">{product.description}</p>
          <div className="chip-row">
            {product.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="space-between" style={{ marginTop: 16 }}>
            <strong>{formatCurrency(product.price)}</strong>
            <span className="muted">Stock {product.stock}</span>
          </div>
          <div className="chip-row" style={{ marginTop: 16 }}>
            <Button onClick={handleAddToCart}>Add to cart</Button>
            {user ? (
              <Button variant="secondary" onClick={toggleWishlist}>
                {wishlistIds.includes(productId) ? "Remove wishlist" : "Add wishlist"}
              </Button>
            ) : null}
            <Link to="/cart">
              <Button variant="ghost">Open cart</Button>
            </Link>
          </div>
        </article>
        <aside className="panel stack-md">
          <h3>Related products</h3>
          {product.related_products.map((relatedProduct) => (
            <Link key={relatedProduct.id} to={`/products/${relatedProduct.id}`}>
              <span className="chip">{relatedProduct.name}</span>
            </Link>
          ))}
          {product.related_products.length === 0 ? <p className="muted">No related products found yet.</p> : null}
          {user ? (
            <form onSubmit={submitReview}>
              <h3 style={{ marginTop: 20 }}>Write a review</h3>
              <Input
                label="Rating"
                type="number"
                min="1"
                max="5"
                value={reviewForm.rating}
                onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
              />
              <Input
                label="Title"
                value={reviewForm.title}
                onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))}
              />
              <Input
                label="Comment"
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
              />
              <Button type="submit">Post review</Button>
            </form>
          ) : (
            <p className="muted">Login to add reviews and helpful votes.</p>
          )}
        </aside>
      </section>
      {error ? <p className="error">{error}</p> : null}
      <section className="stack-lg">
        {reviews.map((review) => (
          <article className="panel" key={review.id}>
            <div className="space-between">
              <div>
                <strong>{review.title}</strong>
                <p className="muted" style={{ marginTop: 8 }}>
                  {review.user_name} | {review.rating} / 5
                </p>
              </div>
              <span className="tag">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <p>{review.comment}</p>
            {user ? (
              <Button variant="ghost" onClick={() => helpfulVote(review.id)}>
                Helpful ({review.helpful_votes})
              </Button>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

export default Product;
