import Image from 'next/image';

export default function SmartImage(props) {
  const { loading, priority, ...rest } = props;
  
  // If priority is true, we MUST NOT have loading="lazy"
  if (priority) {
    return <Image priority {...rest} />;
  }
  
  return <Image loading={loading || "lazy"} {...rest} />;
}
