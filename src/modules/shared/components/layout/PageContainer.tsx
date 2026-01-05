/**
 * PageContainer - Contenedor base para páginas
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { ReactNode } from 'react';

const StyledPageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const PageContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[1],
}));

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disablePadding?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  maxWidth = 'lg',
  disablePadding = false,
  className,
}) => {
  return (
    <StyledPageContainer className={className}>
      <Container maxWidth={maxWidth} disableGutters={disablePadding}>
        {(title || subtitle || breadcrumbs || actions) && (
          <PageHeader>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return isLast ? (
                    <Typography key={index} color="text.primary">
                      {item.label}
                    </Typography>
                  ) : (
                    <Link key={index} color="inherit" href={item.href || '#'} underline="hover">
                      {item.label}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box>
                {title && (
                  <Typography variant="h4" component="h1" gutterBottom>
                    {title}
                  </Typography>
                )}

                {subtitle && (
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {actions && <Box sx={{ ml: 2 }}>{actions}</Box>}
            </Box>
          </PageHeader>
        )}

        <PageContent>{children}</PageContent>
      </Container>
    </StyledPageContainer>
  );
};

export default PageContainer;
