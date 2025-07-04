import React from 'react'
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

interface CourseProgressProps {
    value: number;
    variant?: 'default' | 'success';
    size?: 'default' | 'sm';
}
const colorByVariant = {
    default: 'text-sky-700',
    success: 'text-emerald-700',
}

const sizeByVariant = {
    default: 'text-sm',
    sm: 'text-xs',
}

const CourseProgress = async ({ value, variant, size }: CourseProgressProps) => {

    return (
        <div>
            <Progress className='h-2' value={value} variant={variant} />
            <p className={cn("font-medium mt-2", colorByVariant[variant || "default"], sizeByVariant[size || "default"])}>{Math.round(value || 0)}% Complete</p>

        </div>
    )
}

export default CourseProgress
