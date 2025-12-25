import { GraphQLError } from 'graphql';
import { AuthContext } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';

export const createContext = async ({
  req,
}: {
  req: { headers: { authorization?: string } };
}): Promise<AuthContext> => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = verifyToken(token);
    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    };
  } catch (error) {
    return { user: null };
  }
};

export const requireAuth = (context: AuthContext): void => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
};

export const requireAdmin = (context: AuthContext): void => {
  requireAuth(context);
  if (context.user?.role !== 'Admin') {
    throw new GraphQLError('Admin access required', {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
};

