import jwt from "jsonwebtoken";

export function requireAuth(context, { roles = [], minTier = 1 } = {}) {
  const { req } = context;
  const token = req.cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 Role check
    if (
      roles.length > 0 &&
      (!decoded.roles || !roles.some(role => decoded.roles.includes(role)))
    ) {
      return {
        redirect: {
          destination: "/unauthorized", // Or a more specific error page
          permanent: false,
        },
      };
    }

    // 🔒 Tier check
    if (!decoded.tier || decoded.tier < minTier) {
      return {
        redirect: {
          destination: "/admin", // Or somewhere safer
          permanent: false,
        },
      };
    }

    return { props: { user: decoded } };
  } catch (err) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }
}
