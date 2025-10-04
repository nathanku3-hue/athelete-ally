import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedSearch } from '@/components/ui/advanced-search';

const mockFilters = [
  {
    key: 'difficulty',
    label: '难度',
    type: 'multiselect' as const,
    options: [
      { value: 'beginner', label: '初级' },
      { value: 'intermediate', label: '中级' },
      { value: 'advanced', label: '高级' },
    ],
  },
  {
    key: 'category',
    label: '类别',
    type: 'select' as const,
    options: [
      { value: 'strength', label: '力量训练' },
      { value: 'cardio', label: '有氧训练' },
    ],
  },
  {
    key: 'duration',
    label: '持续时间',
    type: 'range' as const,
    min: 1,
    max: 52,
  },
];

describe('AdvancedSearch', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and filter button', () => {
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('筛选')).toBeInTheDocument();
  });

  it('calls onSearch when search button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索...');
    const searchButton = screen.getByText('搜索');

    await user.type(searchInput, 'test query');
    await user.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
  });

  it('calls onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索...');
    await user.type(searchInput, 'test query{enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    // Clear button is the last button with X icon (ghost variant)
    const buttons = screen.getAllByRole('button');
    const clearButton = buttons[buttons.length - 1]; // Last button is the clear button
    await user.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('shows filter panel when filter button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const filterButton = screen.getByText('筛选');
    await user.click(filterButton);

    expect(screen.getByText('筛选选项')).toBeInTheDocument();
    expect(screen.getByText('难度')).toBeInTheDocument();
    expect(screen.getByText('类别')).toBeInTheDocument();
    expect(screen.getByText('持续时间')).toBeInTheDocument();
  });

  it('handles multiselect filter correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const filterButton = screen.getByText('筛选');
    await user.click(filterButton);

    const beginnerCheckbox = screen.getByLabelText('初级');
    const intermediateCheckbox = screen.getByLabelText('中级');

    await user.click(beginnerCheckbox);
    await user.click(intermediateCheckbox);

    expect(beginnerCheckbox).toBeChecked();
    expect(intermediateCheckbox).toBeChecked();
  });

  it('handles select filter correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const filterButton = screen.getByText('筛选');
    await user.click(filterButton);

    const categorySelect = screen.getByDisplayValue('全部');
    await user.selectOptions(categorySelect, 'strength');

    expect(categorySelect).toHaveValue('strength');
  });

  it('handles range filter correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const filterButton = screen.getByText('筛选');
    await user.click(filterButton);

    const minInput = screen.getByPlaceholderText('最小值');
    const maxInput = screen.getByPlaceholderText('最大值');

    await user.type(minInput, '4');
    await user.type(maxInput, '12');

    expect(minInput).toHaveValue(4);
    expect(maxInput).toHaveValue(12);
  });

  it('shows active filter badges', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const filterButton = screen.getByText('筛选');
    await user.click(filterButton);

    const beginnerCheckbox = screen.getByLabelText('初级');
    await user.click(beginnerCheckbox);

    const searchButton = screen.getByText('搜索');
    await user.click(searchButton);

    expect(screen.getByText('难度: beginner')).toBeInTheDocument();
  });

  it('removes filter badge when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedSearch
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        filters={mockFilters}
      />
    );

    const filterButton = screen.getByText('筛选');
    await user.click(filterButton);

    const beginnerCheckbox = screen.getByLabelText('初级');
    await user.click(beginnerCheckbox);

    const searchButton = screen.getByText('搜索');
    await user.click(searchButton);

    const removeButton = screen.getByRole('button', { name: /remove|删除|移除/i });
    await user.click(removeButton);

    expect(screen.queryByText('难度: 初级')).not.toBeInTheDocument();
  });
});
