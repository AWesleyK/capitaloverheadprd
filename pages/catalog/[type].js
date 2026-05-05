// /pages/catalog/[type].js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import clientPromise from "../../lib/mongodb";
import styles from '../../styles/pageStyles/CatalogType.module.scss';
import Image from '../../components/Shared/SmartImages';
import Link from 'next/link';
import navData from '../../data/nav-data.json';
import { FaSearch, FaChevronRight, FaFilter, FaPhoneAlt } from 'react-icons/fa';

export async function getStaticPaths() {
  const paths = navData.catalogTypes.map((type) => ({
    params: { type: type.type.toLowerCase() },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const client = await clientPromise;
  const db = client.db("garage_catalog");
  
  // Settings from the correct lowercase collection
  const settingsDoc = await db.collection("catalogsettings").findOne({ key: "catalogSettings" });
  
  // Find items for this type, case-insensitive
  const items = await db.collection("catalogItems")
    .find({ type: { $regex: new RegExp(`^${params.type}$`, "i") } })
    .toArray();

  return {
    props: {
      type: params.type,
      initialSettings: settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null,
      initialItems: JSON.parse(JSON.stringify(items)),
    },
  };
}

const CatalogTypePage = ({ type, initialSettings, initialItems }) => {
  const router = useRouter();

  const [items, setItems] = useState(initialItems || []);
  const [filteredItems, setFilteredItems] = useState(initialItems || []);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');
  const [displayTypeName, setDisplayTypeName] = useState('');
  const [lastLoggedQuery, setLastLoggedQuery] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  
  // Fallback to navData if initialSettings is null
  const settings = initialSettings || navData.catalogSettings || { showPriceMin: true, showPriceMax: true };

  useEffect(() => {
    if (!type) return;

    // Sync items with props on navigation
    setItems(initialItems || []);
    setFadeIn(false);

    if (initialItems && initialItems.length > 0) {
        setDisplayTypeName(initialItems[0].typeName || type);
    } else {
        // Find type name from navData if no items found yet
        const typeInfo = navData.catalogTypes.find(t => t.type.toLowerCase() === type.toLowerCase());
        setDisplayTypeName(typeInfo?.typeName || type);
    }

    // Apply filters from query if they exist, otherwise reset them to clean state for new category
    const { search: qSearch, brand, min, max } = router.query;
    setSearch(qSearch || '');
    setBrandFilter(brand || '');
    setPriceMinFilter(min || '');
    setPriceMaxFilter(max || '');

    setTimeout(() => setFadeIn(true), 50); // delay slight fade effect
  }, [type, router.query, initialItems]);

  useEffect(() => {
    let result = items;

    if (search) {
      result = result.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (brandFilter) {
      result = result.filter(item => item.brand === brandFilter);
    }

    const applyPriceFilter = (
      (settings.showPriceMin && priceMinFilter !== '') ||
      (settings.showPriceMax && priceMaxFilter !== '')
    );

    if (applyPriceFilter) {
      result = result.filter(item => {
        const min = item.priceMin ?? 0;
        const max = item.priceMax ?? Infinity;
        const filterMin = (settings.showPriceMin && priceMinFilter !== '') ? parseFloat(priceMinFilter) : 0;
        const filterMax = (settings.showPriceMax && priceMaxFilter !== '') ? parseFloat(priceMaxFilter) : Infinity;
        return max >= filterMin && min <= filterMax;
      });
    }

    setFilteredItems(result);

    const timer = setTimeout(() => {
      const currentQuery = JSON.stringify({
        search,
        brandFilter,
        ...(settings.showPriceMin ? { priceMinFilter } : {}),
        ...(settings.showPriceMax ? { priceMaxFilter } : {}),
      });

      if (currentQuery !== lastLoggedQuery && search.length >= 2) {
        fetch("/api/admin/dashboard/logs/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: `/catalog/${type}`,
            queryParams: {
              search,
              brandFilter,
              ...(settings.showPriceMin ? { priceMinFilter } : {}),
              ...(settings.showPriceMax ? { priceMaxFilter } : {}),
            },
          }),
        }).catch(err => console.error("Failed to log search:", err));

        setLastLoggedQuery(currentQuery);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [items, search, brandFilter, priceMinFilter, priceMaxFilter, settings, type, lastLoggedQuery]);

  const brands = [...new Set(items.map(item => item.brand))];

  return (
    <>
      <Head>
        <title>{displayTypeName} Catalog | Dino Doors Garage Doors and More</title>
        <meta name="description" content={`Browse our selection of ${displayTypeName} at Dino Doors. Quality products, expert advice, and professional installation across Oklahoma.`} />
        <link rel="canonical" href={`https://dinodoors.net/catalog/${encodeURIComponent(type)}`} />
        <meta property="og:title" content={`${displayTypeName} Catalog | Dino Doors`} />
        <meta property="og:description" content={`Browse our selection of ${displayTypeName} at Dino Doors. Quality products, expert advice, and professional installation across Oklahoma.`} />
        <meta property="og:url" content={`https://dinodoors.net/catalog/${encodeURIComponent(type)}`} />
        <meta property="og:image" content="https://dinodoors.net/transparent-icon.png" />
        <meta name="twitter:title" content={`${displayTypeName} Catalog | Dino Doors`} />
        <meta name="twitter:description" content={`Browse our selection of ${displayTypeName} at Dino Doors. Quality products, expert advice, and professional installation across Oklahoma.`} />
      </Head>

      <div className={styles.catalogPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1>{displayTypeName} Catalog</h1>
            <p>Quality Solutions for Your Home and Business</p>
          </div>
        </section>

        <div className={`${styles.container} ${fadeIn ? styles.fadeIn : ''}`}>
          <div className={styles.catalogLayout}>
            {/* Sidebar Filters */}
            <aside className={styles.sidebar}>
              <div className={styles.filterBox}>
                <h3><FaFilter /> Filters</h3>
                
                <div className={styles.filterGroup}>
                  <label>Search by Name</label>
                  <div className={styles.searchContainer}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Keyword..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <label>Brand</label>
                  <select onChange={(e) => setBrandFilter(e.target.value)} value={brandFilter}>
                    <option value="">All Brands</option>
                    {brands.map((brand, idx) => <option key={idx} value={brand}>{brand}</option>)}
                  </select>
                </div>

                {(settings.showPriceMin || settings.showPriceMax) && (
                  <div className={styles.filterGroup}>
                    <label>Price Range</label>
                    <div className={styles.priceInputs}>
                      {settings.showPriceMin && (
                        <input
                          type="number"
                          placeholder="Min $"
                          value={priceMinFilter}
                          onChange={(e) => setPriceMinFilter(e.target.value)}
                        />
                      )}
                      {settings.showPriceMax && (
                        <input
                          type="number"
                          placeholder="Max $"
                          value={priceMaxFilter}
                          onChange={(e) => setPriceMaxFilter(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.contactCard}>
                <h4>Need a Quote?</h4>
                <p>Call our experts today for pricing and availability on any model.</p>
                <Link href="tel:4054560399" className={styles.phoneButton}>
                  <FaPhoneAlt /> (405) 456-0399
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
              <div className={styles.resultsHeader}>
                <p>Showing <strong>{filteredItems.length}</strong> {displayTypeName.toLowerCase()}s</p>
                { (search || brandFilter || priceMinFilter || priceMaxFilter) && (
                    <button onClick={() => {
                        setSearch('');
                        setBrandFilter('');
                        setPriceMinFilter('');
                        setPriceMaxFilter('');
                    }} className={styles.clearBtn}>Clear All</button>
                )}
              </div>

              <div className={styles.grid}>
                {filteredItems.map(item => (
                  <Link
                    key={item._id}
                    href={{
                      pathname: `/catalog/item/${item.slug}`,
                      query: {
                        search,
                        brand: brandFilter,
                        ...(settings.showPriceMin ? { min: priceMinFilter } : {}),
                        ...(settings.showPriceMax ? { max: priceMaxFilter } : {}),
                      },
                    }}
                    className={styles.card}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={item.imageUrl || '/images/placeholder.png'}
                        alt={item.name}
                        width={400}
                        height={300}
                        className={styles.cardImage}
                        unoptimized
                      />
                      <div className={styles.cardOverlay}>
                        <span>View Details <FaChevronRight /></span>
                      </div>
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.brandName}>{item.brand}</span>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      {(() => {
                        const parts = [];
                        if (settings.showPriceMin && item.priceMin) parts.push(`$${item.priceMin}`);
                        if (settings.showPriceMax && item.priceMax) parts.push(`$${item.priceMax}`);
                        return parts.length ? (
                          <p className={styles.itemPrice}>{parts.join(' - ')}</p>
                        ) : (
                          <p className={styles.callForPrice}>Call for Pricing</p>
                        );
                      })()}
                    </div>
                  </Link>
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className={styles.noResults}>
                    <p>No products found matching your current filters.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogTypePage;
