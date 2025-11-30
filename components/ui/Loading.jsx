import { MoonLoader } from "react-spinners";

const Loading = ({ isLoading }) => {
    return (
        <div className="flex justify-center">
            <MoonLoader
                color="gray"
                loading={isLoading}
                size={24}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
};

export default Loading;
