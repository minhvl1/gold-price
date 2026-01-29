/**
 * Chart.js Configuration - Minimal Design Theme
 */

const ChartConfig = {
    // Color palette
    colors: {
        gold: {
            line: '#D4AF37',
            fill: 'rgba(212, 175, 55, 0.1)',
            point: '#B8941F'
        },
        sjc: {
            line: '#DC2626',
            fill: 'rgba(220, 38, 38, 0.1)',
            point: '#991B1B'
        },
        silver: {
            line: '#6B7280',
            fill: 'rgba(107, 116, 128, 0.1)',
            point: '#4B5563'
        },
        grid: '#E5E7EB',
        text: '#6B7280'
    },

    // Default chart options
    getDefaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 16,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: '500'
                        },
                        color: this.colors.text
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1A1A1A',
                    bodyColor: '#6B7280',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        weight: '400'
                    },
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('vi-VN').format(context.parsed.y) + ' VNĐ';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm'
                        },
                        tooltipFormat: 'DD/MM HH:mm'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        },
                        color: this.colors.text,
                        maxRotation: 0
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: this.colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        },
                        color: this.colors.text,
                        callback: function (value) {
                            return new Intl.NumberFormat('vi-VN', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value);
                        }
                    },
                    border: {
                        display: false
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4,
                    borderWidth: 2
                },
                point: {
                    radius: 0,
                    hitRadius: 8,
                    hoverRadius: 4,
                    hoverBorderWidth: 2
                }
            }
        };
    },

    // Create dataset configuration
    createDataset(label, data, type = 'gold') {
        const colorConfig = this.colors[type] || this.colors.gold;

        return {
            label: label,
            data: data,
            borderColor: colorConfig.line,
            backgroundColor: colorConfig.fill,
            pointBackgroundColor: colorConfig.point,
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            fill: true
        };
    }
};

// Make it globally available
window.ChartConfig = ChartConfig;
