// components/LazyLoadWrapper.js
import { useInView } from 'react-intersection-observer';

export default function LazyLoadWrapper({ children }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div ref={ref} style={{ minHeight: '300px' }}>
      {inView ? children : null}
    </div>
  );
}
