import React, { useEffect, useState } from "react";

import { Link as RouterLink, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import MuiLink from "@mui/material/Link";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading product...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardMedia alt={product.name} component="img" image={product.image} sx={{ maxHeight: 360, objectFit: "cover" }} />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Chip label={product.category} />
                <Chip
                  label={`${product.review_summary.average_rating} / 5 from ${product.review_summary.total_reviews} reviews`}
                  variant="outlined"
                />
              </Stack>
              <Typography gutterBottom variant="h4">
                {product.name}
              </Typography>
              <Typography color="text.secondary" paragraph>
                {product.description}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {product.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
              <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5">{formatCurrency(product.price)}</Typography>
                <Typography color="text.secondary">Stock {product.stock}</Typography>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Button onClick={handleAddToCart}>Add to cart</Button>
                {user ? (
                  <Button variant="secondary" onClick={toggleWishlist}>
                    {wishlistIds.includes(productId) ? "Remove wishlist" : "Add wishlist"}
                  </Button>
                ) : null}
                <Button component={RouterLink} to="/cart" variant="ghost">
                  Open cart
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography gutterBottom variant="h6">
              Related products
            </Typography>
            <Stack spacing={1}>
              {product.related_products.map((relatedProduct) => (
                <MuiLink
                  key={relatedProduct.id}
                  component={RouterLink}
                  to={`/products/${relatedProduct.id}`}
                  underline="hover"
                  variant="body2"
                >
                  {relatedProduct.name}
                </MuiLink>
              ))}
            </Stack>
            {product.related_products.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No related products found yet.
              </Typography>
            ) : null}
            {user ? (
              <Box component="form" onSubmit={submitReview} sx={{ mt: 3 }}>
                <Typography gutterBottom variant="subtitle1">
                  Write a review
                </Typography>
                <Input
                  inputProps={{ min: 1, max: 5 }}
                  label="Rating"
                  type="number"
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
                />
                <Input label="Title" value={reviewForm.title} onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))} />
                <Input label="Comment" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} />
                <Button type="submit">Post review</Button>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
                Login to add reviews and helpful votes.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      {error ? (
        <Typography color="error" sx={{ mt: 2 }} variant="body2">
          {error}
        </Typography>
      ) : null}
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Typography variant="h6">
          Reviews
        </Typography>
        {reviews.map((review) => (
          <Paper key={review.id} sx={{ p: 2 }} variant="outlined">
            <Stack alignItems="flex-start" direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography fontWeight={600}>{review.title}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {review.user_name} | {review.rating} / 5
                </Typography>
              </Box>
              <Chip label={new Date(review.created_at).toLocaleDateString()} size="small" />
            </Stack>
            <Typography sx={{ mt: 1 }} variant="body1">
              {review.comment}
            </Typography>
            {user ? (
              <Button sx={{ mt: 1 }} variant="ghost" onClick={() => helpfulVote(review.id)}>
                Helpful ({review.helpful_votes})
              </Button>
            ) : null}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}

export default Product;
