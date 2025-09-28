const TimeCard = ({ title, time, description, color, isFullWidth = false }) => {
    let baseClasses, textClasses;
    if (color === 'orange') {
        baseClasses = "bg-orange-100 border-l-4 border-orange-500";
        textClasses = "text-orange-700";
    } else if (color === 'red') {
        baseClasses = "bg-red-100 border-l-4 border-red-500";
        textClasses = "text-red-700";
    } else if (color === 'red-dark') {
        baseClasses = "bg-red-50 border-t-4 border-red-600";
        textClasses = "text-red-800";
    }
    
    const widthClass = isFullWidth ? 'col-span-1 md:col-span-3' : 'col-span-1';

    return (
        <div className={`${widthClass} p-6 rounded-xl shadow-lg ${baseClasses}`}>
            <h2 className={`text-xl font-semibold mb-3 ${textClasses}`}>
                {title}
            </h2>
            <p className="text-4xl font-extrabold mb-4">
                {time}
            </p>
            <p className="text-sm text-gray-600">
                {description}
            </p>
        </div>
    );
}
