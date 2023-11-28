import { Component } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
    children?: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError = () => {
        return { hasError: true };
    };

    componentDidCatch() {
        this.setState({ hasError: true });
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    width: '100%',
                    padding: '20px'
                }}
            >
                <Box
                    sx={{
                        backgroundColor: '#ccc',
                        borderRadius: '4px',
                        padding: '25px',
                        height: '100%',
                        width: '100%'
                    }}
                >
                    <Typography variant="h5" mb="20px">
                        Something went wrong with this section...
                    </Typography>
                    <Typography>
                        We are sorry that you are facing this error. Please
                        refresh the page in a minute or contact administrator,
                        hopefully the page will be up and running soon...
                    </Typography>
                </Box>
            </Box>
        );
    }
}
