import jwt from "jsonwebtoken";

export function requireAuth(context, allowedRoles = []) {
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

    if (
        allowedRoles.length > 0 &&
        (!decoded.roles || !allowedRoles.some(role => decoded.roles.includes(role)))
      ) {      
      return {
        redirect: {
          destination: "/unauthorized", // Or a "no access" page
          permanent: false,
        },
      };
    }

    return { props: { user: decoded } }; // Can optionally pass the user to the page
  } catch (err) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }
}
