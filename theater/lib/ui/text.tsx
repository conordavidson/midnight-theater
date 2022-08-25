import { FC, PropsWithChildren, createElement, ReactHTML } from 'react';

import * as Utils from 'lib/utils';

type TextProps = {
  className?: string;
  as?: keyof ReactHTML;
};

type TextComponent = FC<PropsWithChildren<TextProps>>;

const baseClasses = 'text-gold font-sans font-light';

const Base: FC<PropsWithChildren<TextProps & { defaultClasses: string }>> = ({
  as = 'p',
  children,
  className,
  defaultClasses,
}) => {
  return createElement(
    as,
    {
      className: Utils.cx([baseClasses, defaultClasses, className]),
    },
    children
  );
};

export const Eyebrow: TextComponent = (props) => {
  return <Base defaultClasses="uppercase font-bold text-xs" {...props} />;
};

export const Heading: TextComponent = (props) => {
  return <Base defaultClasses="bold text-2xl" {...props} />;
};

export const Paragraph: TextComponent = (props) => {
  return <Base defaultClasses="text-lg" {...props} />;
};

export const Body: TextComponent = (props) => {
  return <Base defaultClasses="text-md" {...props} />;
};
