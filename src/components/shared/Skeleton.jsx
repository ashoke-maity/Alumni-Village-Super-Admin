import React from 'react';
import { cn } from '../../utils/helpers';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200/80", className)}
            {...props}
        />
    );
};

export { Skeleton };
