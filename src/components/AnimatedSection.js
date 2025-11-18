import React, { useEffect, useRef, useState } from 'react';

const useInView = (options = { threshold: 0.15, rootMargin: '0px' }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

const AnimatedSection = ({ as: Tag = 'div', className = '', animationClass = 'animate-fade-up', revealClass = 'reveal', children, ...rest }) => {
  const { ref, inView } = useInView();
  const classes = [revealClass, inView ? 'in-view' : '', inView ? animationClass : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
};

export default AnimatedSection;
