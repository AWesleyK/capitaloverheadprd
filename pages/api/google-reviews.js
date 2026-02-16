export default async function handler(req, res) {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;

  if (!GOOGLE_MAPS_API_KEY || !GOOGLE_PLACE_ID) {
    console.error('Missing Google API configuration');
    return res.status(500).json({ error: 'Missing Google API configuration' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,user_ratings_total,reviews,url&language=en&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        status: response.status,
        error_message: response.statusText || 'Non-OK HTTP response from Google Places API',
      });
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      console.error('Google Places API Error:', data.status, data.error_message || '');
      return res.status(502).json({
        status: data.status || 'ERROR',
        error_message: data.error_message || 'Invalid response from Google Places API',
      });
    }

    const { name, rating, user_ratings_total, reviews, url: googleUrl } = data.result;

    const formattedReviews = (reviews || []).slice(0, 5).map((review) => ({
      author_name: review.author_name,
      rating: review.rating,
      relative_time_description: review.relative_time_description,
      text: review.text,
      profile_photo_url: review.profile_photo_url,
    }));

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      name,
      rating,
      user_ratings_total,
      url: googleUrl,
      reviews: formattedReviews,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Google Reviews API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
