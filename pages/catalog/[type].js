// /pages/catalog/[type].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/pageStyles/CatalogType.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const CatalogTypePage = () => {
  const router = useRouter();
  const { type } = router.query;

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');
  const [displayTypeName, setDisplayTypeName] = useState('');
  const [lastLoggedQuery, setLastLoggedQuery] = useState(null);


  useEffect(() => {
    if (!type) return;

    const fetchItems = async () => {
      try {
        const res = await fetch('/api/catalog/get');
        const data = await res.json();
        const typeFiltered = data.filter(item => item.type.toLowerCase() === type.toLowerCase());
        setItems(typeFiltered);
        setDisplayTypeName(typeFiltered[0]?.typeName || type);

        const { search: qSearch, brand, min, max } = router.query;
        if (qSearch) setSearch(qSearch);
        if (brand) setBrandFilter(brand);
        if (min) setPriceMinFilter(min);
        if (max) setPriceMaxFilter(max);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      }
    };

    fetchItems();
  }, [type]);

  useEffect(() => {
    let result = items;
  
    if (search) {
      result = result.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (brandFilter) {
      result = result.filter(item => item.brand === brandFilter);
    }
    if (priceMinFilter !== '' || priceMaxFilter !== '') {
      result = result.filter(item => {
        const min = item.priceMin ?? 0;
        const max = item.priceMax ?? Infinity;
        const filterMin = priceMinFilter !== '' ? parseFloat(priceMinFilter) : 0;
        const filterMax = priceMaxFilter !== '' ? parseFloat(priceMaxFilter) : Infinity;
        return max >= filterMin && min <= filterMax;
      });
    }
  
    setFilteredItems(result);
  
    // 🔁 Debounced logger
    const timer = setTimeout(() => {
      const currentQuery = JSON.stringify({ search, brandFilter, priceMinFilter, priceMaxFilter });
  
      if (currentQuery !== lastLoggedQuery && search.length >= 2) {
        fetch("/api/admin/dashboard/logs/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: `/catalog/${type}`,
            queryParams: {
              search,
              brandFilter,
              priceMinFilter,
              priceMaxFilter,
            },
          }),
        }).catch(err => console.error("Failed to log search:", err));
  
        setLastLoggedQuery(currentQuery);
      }
    }, 1200); // wait 800ms of inactivity before logging
  
    return () => clearTimeout(timer);
  }, [items, search, brandFilter, priceMinFilter, priceMaxFilter]);
  
  

  const brands = [...new Set(items.map(item => item.brand))];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{displayTypeName} Catalog</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setBrandFilter(e.target.value)} value={brandFilter}>
          <option value="">All Brands</option>
          {brands.map((brand, idx) => <option key={idx} value={brand}>{brand}</option>)}
        </select>

        <div className={styles.priceFilterGroup}>
          <input
            type="number"
            placeholder="Min Price"
            value={priceMinFilter}
            onChange={(e) => setPriceMinFilter(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Price"
            value={priceMaxFilter}
            onChange={(e) => setPriceMaxFilter(e.target.value)}
          />
        </div>
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
                min: priceMinFilter,
                max: priceMaxFilter,
              },
            }}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <Image src={item.imageUrl} alt={item.name} width={300} height={300} className={styles.cardImage} unoptimized />
            </div>
            <h3>{item.name}</h3>
            <p>
              {item.brand} -
              {item.priceMin ? ` $${item.priceMin}` : ''}
              {item.priceMax ? ` - $${item.priceMax}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CatalogTypePage;
