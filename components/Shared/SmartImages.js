import Image from 'next/image';

export default function SmartImage(props) {
  return <Image loading="lazy" {...props} />;
}
