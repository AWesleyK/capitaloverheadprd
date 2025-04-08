// /pages/_app.js
import '../styles/globals.scss';
import Layout from '../components/Layout/Layout';

function MyApp({ Component, pageProps, services }) {
  return (
    <Layout services={services || []}>
      <Component {...pageProps} />
    </Layout>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  let services = [];

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  if (typeof window === 'undefined') {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = ctx?.req?.headers?.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    try {
      const res = await fetch(`${baseUrl}/api/services/menu`);
      services = await res.json();
    } catch (e) {
      console.error("Failed to fetch services:", e);
    }
  }

  return { pageProps, services };
};

export default MyApp;
