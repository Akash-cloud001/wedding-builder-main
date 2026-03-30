declare module 'react-contenteditable' {
    import * as React from 'react';

    export interface Props extends React.HTMLAttributes<HTMLElement> {
        html: string;
        disabled?: boolean;
        tagName?: string;
        className?: string;
        style?: React.CSSProperties;
        innerRef?: React.RefObject<HTMLElement> | Function;
    }

    export default class ContentEditable extends React.Component<Props> { }
}
